export type AliasMap = {
  name: string;
  value: string;
};

export type VarMap = {
  name: string;
  value: string;
};

export type SrcKey = string;
export type DestKey = string;

export type LayerMapping = {
  src: SrcKey;
  dest: DestKey;
};

export type LayerConfig = {
  name: string;
  mappings: LayerMapping[];
};

export type KanataConfig = {
  name?: string;
  config: string;
  src: SrcKey[];
  vars: VarMap[];
  alias: AliasMap[];
  layers: LayerConfig[];
};
