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
  /** True when the due date has passed and the action is not DONE. */
  overdue: boolean;
};

export type HistoryPoint = {
  period: string;
  periodOrder: number;
  riskId: string | null;
  cr: number;
  exposure: number;
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
