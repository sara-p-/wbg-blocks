import { registerBlockType } from "@wordpress/blocks";
import { addCard } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: addCard,
	edit: Edit,
	save,
});
