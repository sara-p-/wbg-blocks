import { registerBlockType } from "@wordpress/blocks";
import { InnerBlocks } from "@wordpress/block-editor";
import { details } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: details,
	edit: Edit,
	save: () => <InnerBlocks.Content />,
});
