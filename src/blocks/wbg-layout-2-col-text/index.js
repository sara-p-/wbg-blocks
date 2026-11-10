import { registerBlockType } from "@wordpress/blocks";
import { drawerRight } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: drawerRight,
	edit: Edit,
	save,
});
