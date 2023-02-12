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

class NameTag extends HTMLElement {
  static get observedAttributes() {
    return ['greeting'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets,
      styles
    ];
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