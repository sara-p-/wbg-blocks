import { registerBlockType } from "@wordpress/blocks";
import { Icon, lineSolid } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: lineSolid,
	edit: Edit,
	save,
});
