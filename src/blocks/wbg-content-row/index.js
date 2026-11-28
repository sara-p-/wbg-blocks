import { registerBlockType } from "@wordpress/blocks";
import { row } from "@wordpress/icons";
import { InnerBlocks } from "@wordpress/block-editor";

import "./style.scss";

import Edit from "./edit";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: row,
	edit: Edit,
	save: () => <InnerBlocks.Content />,
});
