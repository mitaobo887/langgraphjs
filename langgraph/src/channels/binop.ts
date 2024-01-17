import { BaseChannel, EmptyChannelError } from "./index.js";

type BinaryOperator<Value> = (a: Value, b: Value) => Value;

/**
 * Stores the result of applying a binary operator to the current value and each new value.
 */
export class BinaryOperatorAggregate<Value> extends BaseChannel<
  Value,
  Value,
  Value
> {
  lc_graph_name = "BinaryOperatorAggregate";

  value: Value | undefined;

  operator: BinaryOperator<Value>;

  constructor(operator: BinaryOperator<Value>, initialValue?: Value) {
    super();

    this.operator = operator;
    this.value = initialValue;
  }

  public empty(checkpoint?: Value): BinaryOperatorAggregate<Value> {
    const empty = new BinaryOperatorAggregate(
      this.operator,
      checkpoint ?? this.value
    );
    return empty;
  }

  public update(values: Value[]): void {
    let newValues = values;
    if (!newValues.length) return;

    if (this.value === undefined) {
      [this.value] = newValues;
      newValues = newValues.slice(1);
    }

    for (const value of newValues) {
      if (this.value !== undefined) {
        this.value = this.operator(this.value, value);
      }
    }
  }

  public get(): Value {
    if (this.value === undefined) {
      throw new EmptyChannelError();
    }
    return this.value;
  }

  public checkpoint(): Value {
    if (!this.value) {
      throw new EmptyChannelError();
    }
    return this.value;
  }
}