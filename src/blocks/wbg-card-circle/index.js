import { registerBlockType } from "@wordpress/blocks";
import { border } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: border,
	edit: Edit,
	save,
});
