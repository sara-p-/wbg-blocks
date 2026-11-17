import { registerBlockType } from "@wordpress/blocks";
import { InnerBlocks } from "@wordpress/block-editor";
import { code } from "@wordpress/icons";

import "./style.scss";

import Edit from "./edit";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: code,
	edit: Edit,
	save: () => <InnerBlocks.Content />,
});
