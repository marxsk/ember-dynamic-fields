import Ember from "ember";
import Component from "@ember/component";
import layout from "../templates/components/form-dynamic";

export default Component.extend({
  layout,
  _source: undefined,

  isEmpty(record) {
    return record === "";
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
      if (typeof this.get("_source.firstObject") === "string") {
        this.get("_source").pushObject("");
      } else {
        this.get("_source").pushObject(Ember.Object.create());
      }
    }
  },

  actions: {
    update: function(target, targetIndex, arg3) {
      Ember.Logger.assert(
        typeof targetIndex === "number",
        "dynamic-fields: targetIndex parameter for update() should be number"
      );

      let value;
      /*global jQuery*/
      if (
        arg3.__proto__ === jQuery.Event.prototype ||
        arg3.__proto__ === Event.prototype
      ) {
        value = arg3.target.value;
      } else {
        value = arg3;
      }

      if (targetIndex == this.get("_source.length") - 1) {
        // @refactor -- should be same as with the didReceiveAttrs
        if (!this.isEmpty(value)) {
          if (typeof this.get("_source.firstObject") === "string") {
            this.get("_source").pushObject("");
          } else {
            //this.get("_source").pushObject(Ember.Object.create());
            this.get("_source").pushObject("");
          }
        }
      } else {
        // @todo: delete field
      }
    }
  }
});
