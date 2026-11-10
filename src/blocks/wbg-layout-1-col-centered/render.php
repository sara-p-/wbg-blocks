<?php
/**
 * Layout - 1-Col - Centered: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraphs, h3–h6 headings, buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! function_exists( 'wbg_layout_1_col_centered_has_text' ) ) {
	/**
	 * True if a rich text value contains visible text (not just tags/whitespace).
	 *
	 * @param string $html Rich text HTML.
	 * @return bool
	 */
	function wbg_layout_1_col_centered_has_text( $html ) {
		return '' !== trim( html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' ), " \t\n\r\0\x0B\xC2\xA0" );
	}
}

if ( ! function_exists( 'wbg_layout_1_col_centered_gap_value' ) ) {
	/**
	 * Converts a stored blockGap value ("var:preset|spacing|40" or a raw CSS value)
	 * into a CSS value. Mirrors getGapCSSValue() in edit.js.
	 *
	 * @param mixed $gap Stored blockGap value.
	 * @return string CSS value, or '' if not set.
	 */
	function wbg_layout_1_col_centered_gap_value( $gap ) {
		if ( ! is_string( $gap ) || '' === $gap ) {
			return '';
		}

		$prefix = 'var:preset|spacing|';
		if ( str_starts_with( $gap, $prefix ) ) {
			return 'var(--wp--preset--spacing--' . substr( $gap, strlen( $prefix ) ) . ')';
		}

		return $gap;
	}
}

$wbg_subheading    = $attributes['subheading'] ?? '';
$wbg_heading       = $attributes['heading'] ?? '';
$wbg_content_width = $attributes['contentWidth'] ?? 'normal';
$wbg_block_gap     = $attributes['style']['spacing']['blockGap'] ?? '';

$wbg_has_subheading = wbg_layout_1_col_centered_has_text( $wbg_subheading );
$wbg_has_heading    = wbg_layout_1_col_centered_has_text( $wbg_heading );
$wbg_has_content    = '' !== trim( $content );

// With a subheading: subheading = h2.fake--h6, heading = h3.h1--alt.
// Without one: heading = plain h2.
$wbg_heading_tag   = $wbg_has_subheading ? 'h3' : 'h2';
$wbg_heading_class = 'wp-block-heading wbg-layout-1-col-centered__heading h1--alt';

$wbg_wrapper_classes = array( 'wbg-layout-1-col-centered', 'alignfull' );
if ( 'wide' === $wbg_content_width ) {
	$wbg_wrapper_classes[] = 'content-width--wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_wrapper_classes ),
	)
);

// Block Spacing (blockGap) applies only to the inner blocks container.
$wbg_gap_value     = wbg_layout_1_col_centered_gap_value( $wbg_block_gap );
$wbg_content_style = '' !== $wbg_gap_value ? safecss_filter_attr( 'gap:' . $wbg_gap_value ) : '';
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-layout-1-col-centered__wrapper">
    <?php if ( $wbg_has_subheading || $wbg_has_heading ) : ?>
    <div class="wbg-layout-1-col-centered__header">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wp-block-heading wbg-layout-1-col-centered__subheading fake--h6">
        <?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php endif; ?>

      <?php if ( $wbg_has_heading ) : ?>
      <div class="wbg-layout-1-col-centered__heading-container">
        <<?php echo tag_escape( $wbg_heading_tag ); ?> class="<?php echo esc_attr( $wbg_heading_class ); ?>">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo tag_escape( $wbg_heading_tag ); ?>>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ( $wbg_has_content ) : ?>
    <div class="wbg-layout-1-col-centered__content"
      <?php echo '' !== $wbg_content_style ? ' style="' . esc_attr( $wbg_content_style ) . '"' : ''; ?>>
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
    <?php endif; ?>
  </div>
</div>