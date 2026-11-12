import { registerBlockType } from "@wordpress/blocks";
import { caption } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: caption,
	edit: Edit,
	save: () => null,
});
