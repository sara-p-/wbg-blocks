<?php
/**
 * Search Results: front-end render.
 *
 * A full-width section that shows the site's search results. The block does
 * not run its own search. It reads the main query that WP has already built
 * for the ?s= URL. When Relevanssi is active it has already run on that
 * query, so its ranking, excerpts and highlighting come through here too.
 * Pagination is the main query's pagination.
 *
 * Results are grouped by post type. Groups appear in the order of their best
 * match, and results in each group stay in relevance order. Grouping covers
 * the current page of results only.
 *
 * Layout width (`layoutWidth`)
 * - standard (default): __wrapper is the WP wide width.
 * - wide: adds .layout--wide, and __wrapper is the theme.json
 *   settings.custom.layout.extra-wide width.
 *
 * Top/bottom padding, background color, background image and text color
 * come from WP's native block supports. get_block_wrapper_attributes() adds
 * the padding and color classes/styles, and WP adds the background image
 * styles to the outer div.
 *
 * Markup
 * - .wbg-search-results.alignfull: background, colors, top/bottom padding.
 *   - __wrapper: the results. Width from the layout setting, with WP root
 *     padding left and right.
 *     - __summary: result count and search term.
 *     - __group (one per post type): __group-title, then the __list grid
 *       of __item cards (3 columns desktop, 2 tablet, 1 mobile).
 *     - __empty: shown when nothing matched.
 *     - __pagination.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (unused).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Only render on a search request.
 * ------------------------------------------------------------------------ */

if ( ! is_search() ) {
	return;
}

global $wp_query;

/*
 * Attributes.
 * ------------------------------------------------------------------------ */

$wbg_is_wide = isset( $attributes['layoutWidth'] ) && 'wide' === $attributes['layoutWidth'];

/*
 * Results.
 * ------------------------------------------------------------------------ */

$wbg_search_term = get_search_query( false );
$wbg_total       = (int) $wp_query->found_posts;

// Group by post type, keeping the order WP (or Relevanssi) returned them in.
$wbg_groups = array();
foreach ( (array) $wp_query->posts as $wbg_result ) {
	$wbg_result = get_post( $wbg_result );
	if ( ! $wbg_result ) {
		continue;
	}
	$wbg_groups[ $wbg_result->post_type ][] = $wbg_result;
}

$wbg_pagination = paginate_links(
	array(
		'mid_size'  => 1,
		'prev_text' => __( 'Previous', 'wbg-blocks' ),
		'next_text' => __( 'Next', 'wbg-blocks' ),
	)
);

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_classes = array( 'wbg-search-results', 'alignfull' );
if ( $wbg_is_wide ) {
	$wbg_classes[] = 'layout--wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-search-results__wrapper">

    <p class="wbg-search-results__summary">
      <?php
      if ( '' !== $wbg_search_term ) {
        printf(
          /* translators: 1: number of results, 2: search term. */
          esc_html( _n( '%1$s result for “%2$s”', '%1$s results for “%2$s”', $wbg_total, 'wbg-blocks' ) ),
          esc_html( number_format_i18n( $wbg_total ) ),
          esc_html( $wbg_search_term )
        );
      } else {
        printf(
          /* translators: %s: number of results. */
          esc_html( _n( '%s result', '%s results', $wbg_total, 'wbg-blocks' ) ),
          esc_html( number_format_i18n( $wbg_total ) )
        );
      }
      ?>
    </p>

    <?php if ( empty( $wbg_groups ) ) : ?>
    <p class="wbg-search-results__empty">
      <?php esc_html_e( 'Nothing matched. Try a different word or a plant’s common name.', 'wbg-blocks' ); ?>
    </p>
    <?php else : ?>

    <?php
      foreach ( $wbg_groups as $wbg_type => $wbg_results ) :
        $wbg_type_object = get_post_type_object( $wbg_type );
        $wbg_type_label  = $wbg_type_object ? $wbg_type_object->labels->name : $wbg_type;
        ?>
    <section class="wbg-search-results__group wbg-search-results__group--<?php echo esc_attr( $wbg_type ); ?>">
      <h2 class="wbg-search-results__group-title"><?php echo esc_html( $wbg_type_label ); ?></h2>

      <ul class="wbg-search-results__list">
        <?php
            foreach ( $wbg_results as $wbg_result ) :
              $wbg_link = get_permalink( $wbg_result );

              // Relevanssi's highlighted title, if title highlighting is on.
              $wbg_title = ! empty( $wbg_result->post_highlighted_title )
                ? $wbg_result->post_highlighted_title
                : get_the_title( $wbg_result );

              // Relevanssi's custom excerpt (with highlights) when that's on,
              // otherwise the normal WP excerpt.
              $wbg_excerpt = get_the_excerpt( $wbg_result );
              ?>
        <li class="wbg-search-results__item wbg-search-results__item--<?php echo esc_attr( $wbg_type ); ?>">
          <?php if ( has_post_thumbnail( $wbg_result ) ) : ?>
          <a class="wbg-search-results__thumb" href="<?php echo esc_url( $wbg_link ); ?>" tabindex="-1"
            aria-hidden="true">
            <?php
                    echo get_the_post_thumbnail(
                      $wbg_result,
                      'medium_large',
                      array(
                        'alt'     => '',
                        'loading' => 'lazy',
                      )
                    );
                    ?>
          </a>
          <?php endif; ?>

          <div class="wbg-search-results__body">
            <h3 class="wbg-search-results__title">
              <a href="<?php echo esc_url( $wbg_link ); ?>"><?php echo wp_kses_post( $wbg_title ); ?></a>
            </h3>

            <?php if ( $wbg_excerpt ) : ?>
            <p class="wbg-search-results__excerpt"><?php echo wp_kses_post( $wbg_excerpt ); ?></p>
            <?php endif; ?>
          </div>
        </li>
        <?php endforeach; ?>
      </ul>
    </section>
    <?php endforeach; ?>

    <?php if ( $wbg_pagination ) : ?>
    <nav class="wbg-search-results__pagination"
      aria-label="<?php esc_attr_e( 'Search results pages', 'wbg-blocks' ); ?>">
      <?php echo wp_kses_post( $wbg_pagination ); ?>
    </nav>
    <?php endif; ?>

    <?php endif; ?>

  </div>
</div>