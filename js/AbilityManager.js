import { KeySequenceAbility } from "./KeySequenceAbility.js";

const STATUS_TIMEOUT_MS = 1800;

export class AbilityManager {
  constructor() {
    this.panel = document.querySelector("#keySequenceAbility");
    this.sequenceElement = document.querySelector("#keySequenceKeys");
    this.statusElement = document.querySelector("#keySequenceStatus");
    this.statusTimer = null;

    this.keySequence = new KeySequenceAbility({
      onChange: (state) => this.render(state),
      onSuccess: (sequence) => this.completeSequence(sequence),
      onFailure: () => this.showStatus("Tecla incorrecta. Reinicia desde la primera tecla.", "error"),
    });

    window.tetrisAbilityManager = this;
    window.activateSpecialAbility = (name) => this.activate(name);
  }

  activate(name) {
    if (name !== "keySequence") return false;
    if (this.keySequence.active) return false;

    this.keySequence.start();
    this.showStatus("Completa la secuencia", "active");
    return true;
  }

  handleKey(key) {
    if (!this.keySequence.active) return false;

    const normalizedKey = String(key).toUpperCase();
    this.keySequence.handleKey(normalizedKey);
    return true;
  }

  completeSequence(sequence) {
    if (this.panel) {
      this.panel.hidden = false;
      this.panel.classList.remove("is-active");
    }
    this.showStatus("Secuencia completada", "success");
    window.setTimeout(() => {
      if (this.panel && !this.keySequence.active) this.panel.hidden = true;
    }, STATUS_TIMEOUT_MS);

    window.dispatchEvent(
      new CustomEvent("tetris-special-ability-completed", {
        detail: {
          name: "keySequence",
          sequence,
          action: null,
        },
      }),
    );

    console.log("Key sequence completed. Action is ready to be implemented.");
  }

  render(state) {
    if (!this.panel || !this.sequenceElement) return;

    this.panel.classList.toggle("is-active", state.active);
    this.panel.hidden = false;
    this.sequenceElement.replaceChildren(
      ...state.sequence.map((key, index) => {
        const keyElement = document.createElement("kbd");
        keyElement.textContent = key;
        keyElement.classList.toggle("is-completed", index < state.progress);
        keyElement.classList.toggle("is-current", state.active && index === state.progress);
        return keyElement;
      }),
    );

    if (!state.active && state.sequence.length === 0 && state.progress === 0) {
      this.panel.hidden = true;
    }
  }

  showStatus(message, state = "") {
    if (!this.statusElement) return;

    window.clearTimeout(this.statusTimer);
    this.statusElement.textContent = message;
    this.statusElement.dataset.state = state;
    this.statusTimer = window.setTimeout(() => {
      this.statusElement.textContent = "";
      this.statusElement.dataset.state = "";
    }, STATUS_TIMEOUT_MS);
  }
}
