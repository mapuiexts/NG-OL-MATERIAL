import { type NolmWfsDescribeFeatureTypeRequestOptions } from '../../../services/wfs/wfs-describe-feature-type-request.model';


export interface NolmWfsDescribeFeatureTypeOptions {
  url: string;
  wfsOptions: NolmWfsDescribeFeatureTypeRequestOptions;
  wfsFetchOptions?: any;
}