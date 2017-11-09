# ember-dynamic-fields

This ember-addon was developed to allow dynamically adding multiple form fields. For example, if you want to enter multiple phone numbers for the user. 

## Installation

npm install git+https://git@github.com/marxsk/ember-dynamic-fields.git

## Integration

This package was tested with:
  * <input ... >
  * ember-power-select-multiple
  * ember-form-for
  * ember-changeset

## Usage

    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      <span id={{index}}>
        <input
            value={{record}}
            oninput={{action dynamicUpdate '' index}}
        />
      </span>
    {{/dynamic-fields}}
    
The '' is there just to add an empty argument that is ignored but ember-power-select offers value at the third position and this was the easiest way to fix it. 
