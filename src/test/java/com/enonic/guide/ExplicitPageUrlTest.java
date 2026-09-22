package com.enonic.guide;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.enonic.xp.portal.url.PageUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.sample.features.ExplicitPageUrl;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExplicitPageUrlTest
{
    private ExplicitPageUrl bean;

    private PortalUrlService service;

    @BeforeEach
    void setUp()
    {
        service = mock( PortalUrlService.class );
        final BeanContext context = mock( BeanContext.class );
        when( context.getService( PortalUrlService.class ) ).thenReturn( () -> service );
        when( service.pageUrl( any() ) ).thenReturn( "https://example.test/nested/page" );
        bean = new ExplicitPageUrl();
        bean.initialize( context );
    }

    @Test
    void selectsBaseByPathIndependentlyOfTarget()
    {
        final PageUrlParams params = invoke( Map.of(
            "id", "target-id", "project", "features", "branch", "master",
            "base", Map.of( "path", "/features" ) ) );

        assertEquals( "target-id", params.getId() );
        assertNull( params.getPath() );
        assertEquals( "features", params.getProjectName() );
        assertEquals( "master", params.getBranch() );
        assertEquals( "/features", params.getBase().getPath() );
        assertNull( params.getBase().getId() );
    }

    @Test
    void selectsBaseByIdAndPreservesQueryValues()
    {
        final PageUrlParams params = invoke( Map.of(
            "path", "/features/nested/page", "project", "features", "branch", "draft", "base", Map.of( "id", "site-id" ),
            "params", Map.of( "q", "Tromsø + café & tea", "tag", List.of( "news", "events" ) ) ) );

        assertEquals( "/features/nested/page", params.getPath() );
        assertEquals( "draft", params.getBranch() );
        assertEquals( "features", params.getProjectName() );
        assertEquals( "site-id", params.getBase().getId() );
        assertNull( params.getBase().getPath() );
        assertEquals( List.of( "Tromsø + café & tea" ), params.getParams().get( "q" ) );
        assertEquals( List.of( "news", "events" ), params.getParams().get( "tag" ) );
    }

    @Test
    void leavesBaseUnselectedForTheExistingProjectOnlyExamples()
    {
        final PageUrlParams params = invoke( Map.of( "path", "/features/page", "project", "features" ) );

        assertEquals( "/features/page", params.getPath() );
        assertEquals( "features", params.getProjectName() );
        assertNull( params.getBranch() );
        assertNull( params.getBase() );
    }

    private PageUrlParams invoke( final Map<String, Object> input )
    {
        final ScriptValue value = mock( ScriptValue.class );
        when( value.getMap() ).thenReturn( input );
        assertEquals( "https://example.test/nested/page", bean.pageUrl( value ) );
        final ArgumentCaptor<PageUrlParams> captured = ArgumentCaptor.forClass( PageUrlParams.class );
        verify( service ).pageUrl( captured.capture() );
        return captured.getValue();
    }
}
