package com.enonic.xp.sample.features;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.portal.url.PageUrlParts;
import com.enonic.xp.portal.url.PageUrlPartsParams;
import com.enonic.xp.portal.url.PortalScopeParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.project.ProjectName;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

/**
 * Adapts the fixed explicit-context examples to the XP 8.1 RC3 scope and URL-parts APIs.
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
        final PortalUrlService service = this.portalUrlService.get();
        final PortalScopeParams.Builder scope = PortalScopeParams.create();

        if ( input.get( "project" ) instanceof String project && !project.isEmpty() )
        {
            scope.setProjectName( ProjectName.from( project ) );
        }
        if ( input.get( "branch" ) instanceof String branch && !branch.isEmpty() )
        {
            scope.setBranch( Branch.from( branch ) );
        }

        if ( input.get( "base" ) instanceof Map<?, ?> base )
        {
            if ( base.get( "id" ) instanceof String id && !id.isEmpty() )
            {
                scope.setContentId( ContentId.from( id ) );
            }
            if ( base.get( "path" ) instanceof String path && !path.isEmpty() )
            {
                scope.setContentPath( ContentPath.from( path ) );
            }
        }

        final PageUrlPartsParams.Builder params = PageUrlPartsParams.create()
            .setId( (String) input.get( "id" ) )
            .setPath( (String) input.get( "path" ) )
            .setScope( service.portalScope( scope.build() ) );

        if ( input.get( "params" ) instanceof Map<?, ?> queryParams )
        {
            final Map<String, List<String>> values = new LinkedHashMap<>();
            queryParams.forEach( ( key, value ) -> values.put( key.toString(), value instanceof Collection<?> items
                ? items.stream().map( String::valueOf ).toList()
                : List.of( String.valueOf( value ) ) ) );
            params.setQueryParams( values );
        }

        final PageUrlParts parts = service.pageUrlParts( params.build() );
        return ( parts.baseUrl() == null ? "" : parts.baseUrl() ) + parts.path() + parts.queryString();
    }
}
