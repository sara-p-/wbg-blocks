<?php
/**
 * Content - Headline: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading = $attributes['heading'] ?? '';

// Output nothing if the heading is empty.
if ( '' === trim( wp_strip_all_tags( $wbg_heading ) ) ) {
	return;
}

$wbg_classes = array( 'wbg-content-headline alignfull' );

if ( 'wide' === ( $attributes['contentWidth'] ?? 'normal' ) ) {
	$wbg_classes[] = 'is-width--wide';
}

$wbg_heading_classes = array( 'wbg-content-headline__heading', 'wp-block-heading' );

if ( 'large' === ( $attributes['headingSize'] ?? 'normal' ) ) {
	$wbg_heading_classes[] = 'fake--h1';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);

$wbg_allowed_html = array(
	'strong' => array(),
	'em'     => array(),
	'br'     => array(),
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-headline__wrapper">
    <h2 class="<?php echo esc_attr( implode( ' ', $wbg_heading_classes ) ); ?>">
      <?php echo wp_kses( $wbg_heading, $wbg_allowed_html ); ?>
    </h2>
  </div>
</div>