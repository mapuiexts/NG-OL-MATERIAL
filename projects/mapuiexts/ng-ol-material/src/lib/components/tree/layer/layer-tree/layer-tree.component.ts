import { Component, Input, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import { Map as OlMap } from 'ol';
import { MatCheckboxChange } from '@angular/material/checkbox';

interface LayerNode {
  name: string;
  children?: LayerNode[];
  layer: BaseLayer;
}

interface LayerFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  layer: BaseLayer;
}

@Component({
  selector: 'nolm-layer-tree',
  standalone: true,
  imports: [MatTreeModule, MatIconModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './layer-tree.component.html',
  styleUrl: './layer-tree.component.css',
})
export class NolmLayerTreeComponent implements OnInit {
  private _layerGroup?: LayerGroup;
  @Input({ required: true }) map!: OlMap;
  @Input() style: string = 'width: 100%; height: 100%;';
  @Input() filterFunc: (layer: BaseLayer) => boolean = (layer: BaseLayer) =>
    true;
  @Input() get layerGroup(): LayerGroup | undefined {
    return this._layerGroup;
  }
  set layerGroup(value: LayerGroup | undefined) {
    this._layerGroup = this.layerGroup || value;
  }
  /** The selection for checklist */
  checklistSelection = new SelectionModel<LayerFlatNode>(true /* multiple */);

  private _transformer = (node: LayerNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      layer: node.layer,
    };
  };
  treeControl: FlatTreeControl<LayerFlatNode> =
    new FlatTreeControl<LayerFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
  treeFlattener: MatTreeFlattener<LayerNode, LayerFlatNode> =
    new MatTreeFlattener(
      this._transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    );

  dataSource: MatTreeFlatDataSource<LayerNode, LayerFlatNode> =
    new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  getLevel = (node: LayerFlatNode) => node.level;

  hasChild = (_: number, node: LayerFlatNode) => node.expandable;

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: LayerFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: LayerFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  onParentNodeChecked(event: MatCheckboxChange, node: LayerFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    event.checked
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    //descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
    // set visibility of all children layers
    descendants.forEach((child) => {
      if (child.layer instanceof LayerGroup) {
        child.layer.setVisible(true);
      } else {
        child.layer.setVisible(event.checked);
      }
    });
  }

  /** Toggle a leaf node selection. Check all the parents to see if they changed */
  onLeafNodeChecked(event: MatCheckboxChange, node: LayerFlatNode): void {
    if (node.layer instanceof LayerGroup) {
      node.layer.setVisible(true);
    } else {
      node.layer.setVisible(event.checked);
    }
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: LayerFlatNode): void {
    let parent: LayerFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: LayerFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: LayerFlatNode): LayerFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  ngOnInit() {
    this.layerGroup = this.map.getLayerGroup();
    this._rebuildTreeNodes();
  }

  private _treeNodeFromLayer(layer: BaseLayer): LayerNode {
    let children: LayerNode[] = [];
    if (layer instanceof LayerGroup) {
      let childLayers = layer.getLayers().getArray();
      childLayers = this.filterFunc
        ? childLayers.filter(this.filterFunc)
        : childLayers;
      children = childLayers.map((childLayer) =>
        this._treeNodeFromLayer(childLayer)
      );
      children.reverse();
    }
    const node: LayerNode = {
      name: layer.get('name') || 'Layer',
      layer: layer,
      children: children.length > 0 ? children : undefined,
    };
    return node;
  }

  private _treeNodesFromLayerGroup(layerGroup: LayerGroup): LayerNode[] {
    let layers = layerGroup.getLayers().getArray();
    layers = this.filterFunc ? layers.filter(this.filterFunc) : layers;

    const nodes = layers.map((layer) => this._treeNodeFromLayer(layer));
    nodes.reverse();
    return nodes;
  }

  private _rebuildTreeNodes() {
    if (this.layerGroup) {
      this.dataSource.data = this._treeNodesFromLayerGroup(this.layerGroup);
      this._selectVisibleLeafLayers(this.layerGroup);
    }
  }

  private _selectVisibleLeafLayers(layerGroup: LayerGroup): void {
    let layers = layerGroup.getLayers().getArray();
    layers = this.filterFunc ? layers.filter(this.filterFunc) : layers;
    layers.forEach((layer) => {
      if (layer instanceof LayerGroup) {
        this._selectVisibleLeafLayers(layer);
      } else if (layer.getVisible()) {
        this.treeControl.dataNodes.forEach((node) => {
          if (node.layer === layer) {
            this.checklistSelection.select(node);
          }
        });
      }
    });
  }
}
