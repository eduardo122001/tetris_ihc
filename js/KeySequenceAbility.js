const DEFAULT_SEQUENCE_LENGTH = 5;
const DEFAULT_KEYS = Object.freeze(["W", "A", "S", "D"]);

export class KeySequenceAbility {
  constructor(options = {}) {
    this.keys = options.keys ?? DEFAULT_KEYS;
    this.sequenceLength = options.sequenceLength ?? DEFAULT_SEQUENCE_LENGTH;
    this.sequence = [];
    this.progress = 0;
    this.active = false;
    this.onChange = options.onChange ?? (() => {});
    this.onSuccess = options.onSuccess ?? (() => {});
    this.onFailure = options.onFailure ?? (() => {});
  }

  start() {
    this.sequence = Array.from({ length: this.sequenceLength }, () =>
      this.keys[Math.floor(Math.random() * this.keys.length)],
    );
    this.progress = 0;
    this.active = true;
    this.onChange(this.getState());
    return this.sequence;
  }

  cancel() {
    this.active = false;
    this.sequence = [];
    this.progress = 0;
    this.onChange(this.getState());
  }

  handleKey(key) {
    if (!this.active) return false;

    const normalizedKey = String(key).toUpperCase();
    if (!this.keys.includes(normalizedKey)) return true;

    if (normalizedKey === this.sequence[this.progress]) {
      this.progress++;
      if (this.progress === this.sequence.length) {
        this.active = false;
        const completedSequence = [...this.sequence];
        this.sequence = [];
        this.progress = 0;
        this.onChange(this.getState());
        this.onSuccess(completedSequence);
      } else {
        this.onChange(this.getState());
      }
    } else {
      this.progress = 0;
      this.onFailure(normalizedKey);
      this.onChange(this.getState());
    }

    return true;
  }

  getState() {
    return {
      active: this.active,
      sequence: [...this.sequence],
      progress: this.progress,
    };
  }
}
