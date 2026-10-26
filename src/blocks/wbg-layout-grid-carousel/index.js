import { registerBlockType } from "@wordpress/blocks";
import { reusableBlock } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: reusableBlock,
	edit: Edit,
	save,
});
