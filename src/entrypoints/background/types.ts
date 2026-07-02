export type TranslateMessage = {
  text: string;
  abort?: boolean;
  provider: string;
  apiKey: string;
  model: string;
};

export type DeltaMessage =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };
