import { LitElement, TemplateResult } from "lit";
// import createCache from '@emotion/cache'

export function define(
  tag: string,
  FunctionalComponent: (props: any) => TemplateResult<1>,
  shadowRootOptions?: ShadowRootInit
) {
  class CustomComponent extends LitElement {
    constructor() {
      super();
    }

    static shadowRootOptions = {...LitElement.shadowRootOptions, delegatesFocus: true};

    protected render() {
    // render() {
      console.log('this.attributes:', this.attributes);
      //  get all attributes
      // const renderRoot = this.renderRoot;

      const attributes = Array.from(this.attributes).reduce(
        (acc: { [key: string]: string }, attribute: Attr) => {
          acc[attribute.name] = attribute.value;
          return acc;
        },
        {},
      );

      const component = () => FunctionalComponent({
        ...attributes,
        children: this.children,
      });

      return component();
    }

    // createRenderRoot() {
    protected createRenderRoot() {
      // createCache({
      //   key: tag,
      //   container: this
      // })
    //   console.log('this', this)

    //   // return this.renderRoot?.querySelector('div') ?? null;
      // return super.createRenderRoot();
      // return shadowRootOptions == null ? this : super.createRenderRoot();
      return this;
    }
  }

  window.customElements.define(tag, CustomComponent);

}
