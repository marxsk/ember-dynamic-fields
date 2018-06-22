import Ember from "ember";
import Component from "@ember/component";
import layout from "../templates/components/form-dynamic";

export default Component.extend({
  layout,
  _source: undefined,

  isEmpty() {
    return false;
  },

  didReceiveAttrs() {
    this._super(...arguments);

    if (Ember.isArray(this.get("dataObject"))) {
      this.set("_source", this.get("dataObject"));
    } else if (typeof this.get("dataObject") !== "undefined") {
      Ember.Logger.assert(
        "dataObject have to be Ember.Array if you want to pass data in"
      );
      return;
    } else {
      Ember.Logger.assert("No object was entered - unable to create one");
      return;
    }

    if (!this.isEmpty(this.get("_source.lastObject"))) {
      this.get("_source").pushObject(Ember.Object.create());
    }
  },

  actions: {
    update: async function(target, targetIndex) {
      Ember.Logger.assert(
        typeof targetIndex === "number",
        "dynamic-fields: targetIndex parameter for update() should be number"
      );

      const value = this.get("_source").objectAt(targetIndex);
      if (targetIndex == this.get("_source.length") - 1) {
        if (!this.isEmpty(value)) {
          if (
            this.getWithDefault("limit", -1) === -1 ||
            this.get("limit") - 1 > targetIndex
          ) {
            this.get("_source").pushObject(Ember.Object.create());
          }
        }
      } else {
        if (this.isEmpty(value)) {
          const focusedElements = Ember.$(":focus");
          if (focusedElements.length === 1) {
            const focusedIndex = Ember.$("input")
              .toArray()
              .indexOf(focusedElements[0]);
            await this.get("_source").removeAt(targetIndex);
            Ember.$(`input:eq(${focusedIndex})`).focus();
          } else {
            this.get("_source").removeAt(targetIndex);
          }
        }
      }
    }
  }
});
