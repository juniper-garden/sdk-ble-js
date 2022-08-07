import { TextFieldBase } from "@material/mwc-textfield/mwc-textfield-base";
import { styles } from "@material/mwc-textfield/mwc-textfield.css";
export class IbTextfield extends TextFieldBase {
}
IbTextfield.styles = [styles];
customElements.define("ib-textfield", IbTextfield);
