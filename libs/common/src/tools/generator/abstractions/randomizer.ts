import { WordOptions } from "../word-options";

export interface Randomizer {
  pick<Entry>(list: Array<Entry>): Promise<Entry>;

  pickWord(list: Array<string>, options?: WordOptions): Promise<string>;

  shuffle<Entry>(items: Array<Entry>): Promise<Array<Entry>>;

  chars(length: number): Promise<string>;

  uniform(min: number, max: number): Promise<number>;
}
