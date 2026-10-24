/**
 * Card - Styled: icon registry shared by the editor.
 *
 * @wordpress/scripts runs .svg imports through @svgr/webpack, so each import
 * below is a React component that renders the real inline <svg> markup
 * (which is what lets style.scss control its fill).
 *
 * Path assumes: <plugin>/src/wbg-card-styled/icons.js -> <plugin>/assets/icons/
 *
 * Keep the slugs in sync with the "icon" enum in block.json and with
 * wbg_blocks_get_icon_svg() in PHP.
 */

import { __ } from "@wordpress/i18n";

import BonsaiIcon from "../icons/bonsai.svg";
import BuildingIcon from "../icons/building.svg";
import ButterflyIcon from "../icons/butterfly.svg";
import EducationIcon from "../icons/education.svg";
import FlowersIcon from "../icons/flowers.svg";
import GroupIcon from "../icons/group.svg";
import HeronIcon from "../icons/heron.svg";
import LilypadsIcon from "../icons/lilypads.svg";
import PlantingIcon from "../icons/planting.svg";

export const ICONS = {
	bonsai: { label: __("Bonsai", "wbg-blocks"), Component: BonsaiIcon },
	building: { label: __("Building", "wbg-blocks"), Component: BuildingIcon },
	butterfly: { label: __("Butterfly", "wbg-blocks"), Component: ButterflyIcon },
	education: { label: __("Education", "wbg-blocks"), Component: EducationIcon },
	flowers: {
		label: __("Flowers", "wbg-blocks"),
		Component: FlowersIcon,
	},
	group: { label: __("Group", "wbg-blocks"), Component: GroupIcon },
	heron: { label: __("Heron", "wbg-blocks"), Component: HeronIcon },
	lilypads: { label: __("Lilypads", "wbg-blocks"), Component: LilypadsIcon },
	planting: {
		label: __("Planting", "wbg-blocks"),
		Component: PlantingIcon,
	},
};

export const ICON_OPTIONS = [
	{ label: __("None", "wbg-blocks"), value: "none" },
	...Object.entries(ICONS).map(([value, { label }]) => ({ label, value })),
];
