import { Feature } from "ol";

export interface FeatureLinkLike {
    url: string | ((feature: Feature) => string);
    text: string | ((feature: Feature) => string);
}

type FeatureValueLike = any | ((feature: Feature) => any) | FeatureLinkLike;

export interface FeaturePropertyDefinition {
    name: string;
    label?: string;
    value?: FeatureValueLike;
    //value?: (feature: Feature) => any;
    //link?: (feature: Feature) => string;
}