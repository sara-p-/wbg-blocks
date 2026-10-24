import { registerBlockType } from "@wordpress/blocks";
import { typography } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: typography,
	edit: Edit,
	save,
});
