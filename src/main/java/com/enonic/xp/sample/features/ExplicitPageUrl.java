package com.enonic.xp.sample.features;

import java.util.Map;
import java.util.function.Supplier;

import com.enonic.xp.portal.url.BaseUrlParams;
import com.enonic.xp.portal.url.PageUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

/**
 * Temporary bridge for the explicit-context page URL examples. The JS portal library does not
 * expose the base selection available in the XP 8.1 RC2 Java API.
 */
public final class ExplicitPageUrl
    implements ScriptBean
{
    private Supplier<PortalUrlService> portalUrlService;

    @Override
    public void initialize( final BeanContext context )
    {
        this.portalUrlService = context.getService( PortalUrlService.class );
    }

    public String pageUrl( final ScriptValue options )
    {
        final Map<String, Object> input = options.getMap();
        final PageUrlParams params = new PageUrlParams().id( (String) input.get( "id" ) )
            .path( (String) input.get( "path" ) )
            .projectName( (String) input.get( "project" ) )
            .branch( (String) input.get( "branch" ) );

        if ( input.get( "base" ) instanceof Map<?, ?> base )
        {
            params.base( BaseUrlParams.create()
                             .setId( (String) base.get( "id" ) )
                             .setPath( (String) base.get( "path" ) )
                             .build() );
        }

        if ( input.get( "params" ) instanceof Map<?, ?> queryParams )
        {
            queryParams.forEach( ( key, value ) -> params.param( key.toString(), value ) );
        }

        return this.portalUrlService.get().pageUrl( params );
    }
}
