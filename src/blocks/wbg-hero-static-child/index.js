import { registerBlockType } from "@wordpress/blocks";
import { pullquote } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: pullquote,
	edit: Edit,
	save,
});
