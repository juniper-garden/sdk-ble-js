import { CircularProgressBase } from "@material/mwc-circular-progress/mwc-circular-progress-base";
import { styles } from "@material/mwc-circular-progress/mwc-circular-progress.css";
export class IbCircularProgress extends CircularProgressBase {
}
IbCircularProgress.styles = [styles];
customElements.define("ib-circular-progress", IbCircularProgress);
