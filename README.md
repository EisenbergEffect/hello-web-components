# Hello Web Components

Let's build a Web Component! I like to start with something simple that many of us have familiarity with from the "real world." So, let's build a "name tag" that looks something like this...

![Name Tag Example Image](./img/example.png)

Below I'll provide step by step directions, code samples, and a few notes.

## Step Zero

* Start with a basic HTML document that has an empty JS module script.
* In the body of the document, add a `name-tag` element representing what we would like to get working.
* Start a web server and browse to your HTML file. You should see the text "Web Components" rendered.
  * I use `http-server -c-0` because I've got Node.js and the `http-server` package globally installed, but you can use whatever platform you've got available.

#### index.html

```HTML
<!DOCTYPE html>
<html>
  <head>
    <title>Hello Web Components</title>
  </head>
  <body>
    <name-tag greeting="Hola">Web Components</name-tag>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

#### index.js

```JavaScript
// we'll put our web component code here soon...
```

## Step One

* In your JavaScript file, declare the behavior for your `name-tag` custom element by creating a `class` named `NameTag` that extends from `HTMLElement`.
* Register your element with the browser by calling `customElements.define(...)`, providing your desired HTML tag name and the class that implements the component.
* When you refresh the browser, you should still see the same text as before. However, if you inspect the `name-tag` element, you will see that it's not only an HTMLElement but that its constructor is `NameTag`.

#### index.js

```JavaScript
class NameTag extends HTMLElement {

}

customElements.define('name-tag', NameTag);
```

## Step Two

* Add a constructor and call `this.attachShadow(...)` to create a Shadow DOM tree that will describe how your custom element renders itself. Pass `mode: 'open'` so that the `shadowRoot` and internal elements are still accessible from the outside via JavaScript. Using `open` mode is the standard practice. Make sure you have a strong case for `closed` mode before choosing to go that way.
* Once the Shadow DOM is attached, you can access `this.shadowRoot` and set its `innerHTML` to the HTML of your choosing.
* Refresh the browser and observe that your `innerHTML`'s content is now rendering, but we no longer can see the content of the element being rendered. Where has it gone?
* Open the inspector and observe that there's a `#shadow-root` node that you can inspect to see what you provided as `innerHTML`. Your content is still in the DOM as well, but it isn't rendering. This is because the browser does not know how to compose your content into the Shadow DOM. We'll fix that next.

#### index.js

```JavaScript
class NameTag extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = 'Rendering from Shadow DOM';
  }
}

customElements.define('name-tag', NameTag);
```

## Step Three

* Revise the HTML that is being placed into the `shadowRoot` so that it includes a `<slot>` element. This tells the browser how to compose your Light DOM and Shadow DOM together. The `slot` provides a location to "project" or render the Light DOM content into the Shadow DOM. The content still lives in the Light DOM, but it is rendered as if it were at the location of the `<slot>`.
* Refresh your browser and observe that now both your Light and Shadow DOM content are properly composed.

#### index.js

```JavaScript
class NameTag extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = 'HELLO <slot></slot>';
  }
}

customElements.define('name-tag', NameTag);
```

### Notes

Many (including me) don't find the terms "Light" and "Shadow" DOM particularly intuitive or explanatory. Instead, I like to think of the "Light" DOM as the "Semantic" DOM. This is the DOM you know and love from ages past. The "Shadow" DOM is what I like to think of as the "Render" DOM. It's a private document that describes how the element will render itself, without affecting the semantic HTML.

If you've ever worked with XAML, you can draw a parallel from Light DOM to XAML's Logical Tree, and from Shadow DOM to XAML's Visual Tree. Most native component models have similar concepts.

## Step Four

* To enable our `greeting` attribute to work, we'll need to tell the platform that there's a `greeting` attribute we want to observe. Create a static getter named `observedAttributes` that returns an array of attribute names for the platform to observe.
* Next implement an `attributeChangedCallback` so the platform can inform the element whenever any of its observed attributes change.
* Add a property getter/setter to provide property access to the attribute, since most HTML elements have both properties and attributes. This will ensure our custom element feels like anything else in the platform and that it works correctly with popular front-end frameworks that set both attributes and properties.
* Extract a `render` function that takes the component as input and call it from the `attributeChangedCallback` so that it can update its rendering as state changes.
* We can also introduce a `connectedCallback` which the platform will call when the element is connected to the document. We'll use this to ensure that we've got a default value for `greeting` if one wasn't set by connection time.
* Refresh the browser to see that the `greeting` attribute is now taking effect. Experiment by setting the `greeting` property and the `greeting` attribute and placing breakpoints in the `attributeChangedCallback`.

#### index.js

```JavaScript
const render = x => `${x.greeting.toUpperCase()} <slot></slot>`;

class NameTag extends HTMLElement {
  static get observedAttributes() {
    return ['greeting'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get greeting() {
    return this.getAttribute('greeting');
  }

  set greeting(value) {
    this.setAttribute('greeting', value);
  }

  connectedCallback() {
    if (!this.greeting) {
      this.greeting = 'Hello';
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.shadowRoot.innerHTML = render(this);
  }
}

customElements.define('name-tag', NameTag);
```

## Step Five

* Let's improve our `render` function so that it provides a more realistic structure.
* Refresh the browser to ensure that the new structure is rendering properly.

#### index.js changes

```JavaScript
const render = x => `
  <div part="header" class="header">
    <h3 part="greeting">${x.greeting.toUpperCase()}</h3>
    <h4 part="message">my name is</h4>
  </div>

  <div part="body" class="body">
    <slot></slot>
  </div>

  <div part="footer" class="footer"></div>
`;
```

### Notes

At this point you may be starting to see the amount of boilerplate involved even when creating a simple Web Component. This is because the Web Component standards provide you with the low-level capabilities to create components, but otherwise make no assumptions about how you will implement your component internally. That's up to you to figure out. Many people use a Web Component library to remove boilerplate, automatically sync attributes and properties, and efficiently update the Shadow DOM as attributes and properties change. [Microsoft's FAST team](https://www.fast.design/) has created a small, fast, and low-memory solution named `fast-element` as well as a standard set of base classes named `fast-foundation` so that you don't need to get bogged down with boilerplate and can instead focus on the interesting details of your project. See the Bonus section for more details.

## Step Six

* Leveraging the new standards of Constructible StyleSheets and Adopted StyleSheets, create a `CSSStyleSheet` instance and call `replaceSync` to set its CSS text.
* In your element constructor, append your custom styles to the existing `adoptedStyleSheets` of the `shadowRoot`.
* Refresh your browser to see a fully styled component.

#### index.js changes

```JavaScript
const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    --default-color: red;
    --default-radius: 6px;
    --default-depth: 5px;

    display: inline-block;
    contain: content;
    color: white;
    background: var(--color, var(--default-color));
    border-radius: var(--radius, var(--default-radius));
    min-width: 325px;
    text-align: center;
    box-shadow: 0 0 var(--depth, var(--default-depth)) rgba(0,0,0,.5);
  }

  .header {
    margin: 16px 0;
    position: relative;
  }

  h3 {
    font-weight: bold;
    font-family: sans-serif;
    letter-spacing: 4px;
    font-size: 32px;
    margin: 0;
    padding: 0;
  }

  h4 {
    font-family: sans-serif;
    font-size: 18px;
    margin: 0;
    padding: 0;
  }

  .body {
    background: white;
    color: black;
    padding: 32px 8px;
    font-size: 42px;
    font-family: cursive;
  }

  .footer {
    height: 16px;
    background: var(--color, var(--default-color));
    border-radius: 0 0 var(--radius, var(--default-radius)) var(--radius, var(--default-radius));
  }
`);
```

#### index.js changes

```JavaScript
constructor() {
  super();
  this.attachShadow({ mode: 'open' });
  this.shadowRoot.adoptedStyleSheets = [
    ...this.shadowRoot.adoptedStyleSheets,
    styles
  ];
}
```

Congratulations! You've created a a W3C standard platform Web Component with an encapsulted Shadow DOM for HTML and CSS rendering, attribute reaactivity, and lifecycle integration.

## Going Deeper

### CSS Custom Properties (aka CSS Variables)

A common way to enable custom elements to be styled is to base component styles on CSS Custom Properties (aka CSS Variables). Custom Properties are declared with the `--` prefix and referenced with the `var(...)` function. When referencing a variable, you can also provide a fallback value, which itself can be another variable. You can see this technique used throughout the CSS above. To play with this, create several `<name-tag>` elements on your page and then use the browser's style inspector to set `--color`, `--depth`, and `--radius` properties on individual elements or on parent elements. Even though Shadow DOM encapsulates styles, CSS Variables "pierce" the Shadow DOM boundary by default. This makes it possible to create a theming system that works across an entire component library or application. And remember, CSS Custom Properties can be used together with CSS Calc for amazing affects.

* [Read more about CSS Custom Properties on MDN.](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
* [Read more about CSS Calc on MDN.](https://developer.mozilla.org/en-US/docs/Web/CSS/calc)

### Shadow DOM CSS Selectors

Shadow DOM styles can also leverage special selectors, such as the `:host`, which targets the element itself. It's a best practice to set up host styles for the default `display` and `disabled` states. Check out the `contain` CSS property for ways to improve component render performance as well. If you have special styles for elements placed inside the content of your element, you can specify those by using the `::slotted()` selector.

* [Read more about :host on MDN.](https://developer.mozilla.org/en-US/docs/Web/CSS/:host)
* [Read more about ::slotted on MDN.](https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted)
* [Read more about CSS Contain on MDN.](https://developer.mozilla.org/en-US/docs/web/css/contain)

### Adopted Style Sheeets

Since `adoptedStyleSheets` is not yet implemented in all browsers (I'm looking at you Safari!), for any production components you make, you'll want to feature detect and fallback to style element injection if needed. This is something that many Web Component libraries (e.g. FAST) handle for you automatically.

* [Read more about adopted style sheets on MDN.](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets)

### Parts

You may have noticed that several elements in the element's shadow DOM have a `part` attribute. This allows a web component developer to declare parts of the component that can be styled externally by consumers of the component. To try it out, create several `<name-tag>` elements on your page, each with a different `class`. Then create CSS that targets parts based on a class selector and adjusts the greeting styles. Here's what that might look like:

```css
.large-greeting::part(greeting) {
  font-size: 64px;
}
```

* [Read more about ::part on MDN.](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)

## Bonus: FAST NameTag

As mentioned earlier, the amount of boilerplate involved when creating a simple Web Component seems a bit much. This is because the Web Component standards provide you with the low-level capabilities to create components, but otherwise make no assumptions about how you will implement your component internally. Many people will use a Web Component helper library, such as FAST, to streamline the creation process and provide them with additional tools for building more complex solutions. Here's how the same `NameTag` Web Component would be implemented with FAST, using TypeScript:

```ts
import { attr, css, customElement, FASTElement, html } from "@microsoft/fast-element";

// Create a reactive template based on the element's state.
const template = html<NameTag>`
  <div part="header" class="header">
    <h3 part="greeting">${x => x.greeting.toUpperCase()}</h3>
    <h4 part="message">my name is</h4>
  </div>

  <div part="body" class="body">
    <slot></slot>
  </div>

  <div part="footer" class="footer"></div>
`;

// Create styles that automatically use adopted style sheets when present.
const styles = css`
  :host {
    --default-color: red;
    --default-radius: 6px;
    --default-depth: 5px;

    display: inline-block;
    contain: content;
    color: white;
    background: var(--color, var(--default-color));
    border-radius: var(--radius, var(--default-radius));
    min-width: 325px;
    text-align: center;
    box-shadow: 0 0 var(--depth, var(--default-depth)) rgba(0,0,0,.5);
  }

  .header {
    margin: 16px 0;
    position: relative;
  }

  h3 {
    font-weight: bold;
    font-family: sans-serif;
    letter-spacing: 4px;
    font-size: 32px;
    margin: 0;
    padding: 0;
  }

  h4 {
    font-family: sans-serif;
    font-size: 18px;
    margin: 0;
    padding: 0;
  }

  .body {
    background: white;
    color: black;
    padding: 32px 8px;
    font-size: 42px;
    font-family: cursive;
  }

  .footer {
    height: 16px;
    background: var(--color, var(--default-color));
    bord
`;

// Define the element by providing the tag name, template, and styles.
@customElement({
  name: "name-tag",
  template,
  styles
})
export class NameTag extends FASTElement { // The base class removes boilerplate.
  @attr greeting = "Hello"; // A reactive HTML attribute with default a value.
}
```

Notice how all the boilerplate goes away. Here's what FAST is doing for you:

* **Templates** - FAST provides a high performance, reactivity-based template engine, including support for advanced MVVM.
* **Styles** - FAST automatically detects the presence of adopted style sheets and uses them if possible. It also caches and reuses style sheet instances across Web Component instances for improved performance and memory management.
* **FASTElement** - The base class automatically sets up the Shadow DOM and hooks into the lifecycle to handle rendering with the provided template. The decorator provides a declarative way to connect your template, styles, and class, while registering them with the platform using the provided name.
* **Attributes** - Instead of having to manually declare a getter/setter, setup the `observedAttributes` array, and handle default values and attribute change callbacks, you simply decorate a field with `@attr` and `FASTElement` handles that all for you.

This is only a small example of how FAST can help you build modern Web Components. It has much more to offer, especially if you want to build entire design systems, or full applications with routing, SSR, dependency injection, and advanced state management.

* [Find FAST on GitHub.](https://github.com/microsoft/fast)
* [Explore the full FAST Documentation.](https://www.fast.design/docs/introduction/)

