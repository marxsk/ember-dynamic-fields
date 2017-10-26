import Ember from 'ember';
import layout from '../templates/components/dynamic-fields';

export default Ember.Component.extend({
  layout,

  dataObject: undefined,
  dataObjectKey: undefined,
  elementPrefix: 'dynamic',

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

  actions: {
    // target is not used at all but it is required because of ember-power-select
    // arg3 is either value or jQuery event object
     update: function(target, objectName, arg3) {
       Ember.Logger.assert(objectName, 'dynamic-fields: objectName parameter for update() should not be empty');

       let value;
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

        this.get('_source').pushObject(Ember.Object.create({
          name: `${this.get('elementPrefix')}_0`,
          value: null,
        }));
      }

      const re = /(?:_([^_]+))?$/;
      let lastIndex = parseInt(re.exec(this.get('_source.lastObject.name'))[1]);

      let matchedRecord = this.get('_source').filterBy('name', objectName)[0];
      if (Array.isArray(value)) {
        matchedRecord.set('value', Ember.A(value));
      } else {
        matchedRecord.set('value', value);
      }

      if (`${this.get('elementPrefix')}_${lastIndex}` === objectName) {
        Ember.Logger.debug('dynamic-fields: Adding new field');
        this.get('_source').pushObject(
          Ember.Object.create({
            name: `${this.get('elementPrefix')}_${1 + lastIndex}`,
            value: null
          })
        );
      } else if ((value === undefined) || (value.length === 0) || (value === '')) {
        Ember.Logger.debug(`dynamic-fields: Removing field ${objectName}`);

        this.get('_source').removeObjects(
            this.get('_source').filterBy('name', objectName)
        );
      }
    }
  }
});
