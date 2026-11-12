/**
 * Slide - Image: editor view.
 *
 */

import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
	const blockProps = useBlockProps({
		className: "wbg-slide-image",
	});

	return <div {...blockProps}></div>;
}
