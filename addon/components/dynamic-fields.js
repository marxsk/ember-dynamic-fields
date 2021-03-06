import Ember from 'ember';
import layout from '../templates/components/dynamic-fields';

export default Ember.Component.extend({
  layout,

  dataObject: undefined,
  dataObjectKey: undefined,

  /** Maximal count of repeated elements if defined **/
  max: undefined,

  /**
   * Function that verifies if data in the record should be considered empty.
   * For a more complex element it makes sense to replace this function with user defined.
   */
  isEmpty: (value) => {
      return ((value === undefined) || (value.length === 0) || (value === ''));
  },

  _source: undefined,
  /**
   * The original idea was to use 'source' as the basis for changes.
   * What is good idea but as we work with undefined value, we want
   * to do initialization inside so address is changed. That is a reason
   * to split it into 'dataObject' and 'dataObjectKey' what offers us initialization without
   * changing address of 'dataObject'.
   */
  init() {
      this._super();
      Ember.Logger.assert(this.get('dataObject') !== undefined, 'dynamic-fields: dataObject have to be defined');
  },

  didReceiveAttrs() {
    let x = this.get('dataObject');
    if (this.get('dataObjectKey')) {
      x = this.get(`dataObject.${this.get('dataObjectKey')}`);
    }

    if (Ember.isArray(x)) {
      Ember.Logger.debug('dynamic-fields: Input object was accepted');
      this.set('_source', x);
    } else if (x !== undefined) {
      Ember.Logger.assert('Input object have to be Ember.Array if you want to pass data in');
    }
  },

  actions: {
    // target is not used at all but it is required because of ember-power-select
    // arg3 is either value or jQuery event object
     update: function(target, targetIndex, arg3) {
       Ember.Logger.assert(typeof targetIndex === "number", 'dynamic-fields: targetIndex parameter for update() should be number');

       let value;
       /*global jQuery*/
       if ((arg3.__proto__ === jQuery.Event.prototype) || (arg3.__proto__ === Event.prototype)) {
         value = arg3.target.value;
       } else {
         value = arg3
       }

       // note initialization
      if (this.get('_source') === undefined) {
        Ember.Logger.debug('dynamic-fields: Source was undefined, creating the array with empty item');
        this.set('_source', Ember.A());

        // @todo-note: if dataObjectKey is undefined then use dataObject directly
        if (this.get('dataObjectKey')) {
          this.get('dataObject').set(this.get('dataObjectKey'), this.get('_source'));
        } else {
          this.set('dataObject', this.get('_source'));
        }
      }

      if (targetIndex > (this.get('_source.length') - 1)) {
        this.get('_source').pushObject(value);
      } else {
        if (this.get('isEmpty')(value)) {
          Ember.Logger.debug(`dynamic-fields: Removing field ${targetIndex}`);
          this.get('_source').removeAt(targetIndex);
        } else {
          this.get('_source').replace(targetIndex, 1, [value]);
        }
      }
    }
  }
});
