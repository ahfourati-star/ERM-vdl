export type ControlDTO = {
  name: string;
  type: string;
  efficacy: number;
  description: string | null;
};

export type ActionDTO = {
  title: string;
  status: string;
  percent: number;
  owner: string | null;
  due: string | null;
};

export type RiskDTO = {
  id: string;
  title: string;
  category: string;
  process: string | null;
  owner: string;
  status: string;
  cause: string | null;
  consequence: string | null;
  pi: number;
  ii: number;
  pr: number;
  ir: number;
  pt: number;
  it: number;
  expo: number;
  controls: ControlDTO[];
  actions: ActionDTO[];
};
