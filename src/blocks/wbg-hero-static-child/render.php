<?php
/**
 * Hero - Static - Child: front-end render.
 *
 * The native Background panel stores its values in style.background, but
 * serialization is skipped in block.json, so the wrapper never receives the
 * image. It is applied to the inner pill instead. Text color is serialized
 * normally and lands on the wrapper via get_block_wrapper_attributes().
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading    = $attributes['heading'] ?? '';
$wbg_background = $attributes['style']['background'] ?? array();
$wbg_image      = $wbg_background['backgroundImage'] ?? null;
$wbg_image_url  = is_array( $wbg_image ) ? ( $wbg_image['url'] ?? '' ) : (string) $wbg_image;

$wbg_pill_css = '';

if ( '' !== $wbg_image_url ) {
	$wbg_pill_styles = wp_style_engine_get_styles(
		array(
			'background' => array(
				'backgroundImage'      => array( 'url' => esc_url_raw( $wbg_image_url ) ),
				'backgroundSize'       => $wbg_background['backgroundSize'] ?? null,
				'backgroundPosition'   => $wbg_background['backgroundPosition'] ?? null,
				'backgroundRepeat'     => $wbg_background['backgroundRepeat'] ?? null,
				'backgroundAttachment' => $wbg_background['backgroundAttachment'] ?? null,
			),
		)
	);

	$wbg_pill_css = $wbg_pill_styles['css'] ?? '';
}

/*
 * Block gap applies to the inner blocks only. Core outputs block gap only
 * for blocks with layout support, which this block doesn't have, so the
 * value is applied here as a custom property on the content container.
 * Presets ("var:preset|spacing|48") become CSS variables. With no value
 * set, style.scss falls back to the 48 spacing preset.
 */
$wbg_gap = $attributes['style']['spacing']['blockGap'] ?? '';
$wbg_gap = is_array( $wbg_gap ) ? ( $wbg_gap['top'] ?? '' ) : (string) $wbg_gap;

if ( str_starts_with( $wbg_gap, 'var:' ) ) {
	$wbg_gap = 'var(--wp--' . str_replace( '|', '--', substr( $wbg_gap, 4 ) ) . ')';
}

// Drop anything that could break out of the declaration.
if ( preg_match( '/[;{}<>"\']/', $wbg_gap ) ) {
	$wbg_gap = '';
}

$wbg_content_style = '' !== $wbg_gap ? '--wbg-content-gap:' . $wbg_gap . ';' : '';

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-hero-static-child',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-hero-static-child__wrapper">
    <?php if ( '' !== $wbg_pill_css ) : ?>
    <div class="wbg-hero-static-child__pill" style="<?php echo esc_attr( $wbg_pill_css ); ?>" aria-hidden="true"></div>
    <?php endif; ?>

    <?php if ( '' !== trim( wp_strip_all_tags( $wbg_heading ) ) ) : ?>
    <div class="wbg-hero-static-child__heading-container">
      <h1 class="wp-block-heading wbg-hero-static-child__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h1>
    </div>
    <?php endif; ?>

    <?php if ( '' !== trim( $content ) ) : ?>
    <div class="wbg-hero-static-child__content"
      <?php echo '' !== $wbg_content_style ? ' style="' . esc_attr( $wbg_content_style ) . '"' : ''; ?>>
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
    <?php endif; ?>
  </div>
</div>