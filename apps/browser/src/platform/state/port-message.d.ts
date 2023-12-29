type DerivedStateActions = "nextState" | "resolve" | "initialized";
type DerivedStateMessage = {
  id: string;
  action: DerivedStateActions;
  data?: string; // Json stringified TTo
  originator: "foreground" | "background";
};
