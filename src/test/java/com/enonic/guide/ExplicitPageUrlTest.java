package com.enonic.guide;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.portal.url.PageUrlParts;
import com.enonic.xp.portal.url.PageUrlPartsParams;
import com.enonic.xp.portal.url.PortalScope;
import com.enonic.xp.portal.url.PortalScopeParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.project.ProjectName;
import com.enonic.xp.sample.features.ExplicitPageUrl;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExplicitPageUrlTest
{
    private ExplicitPageUrl bean;

    private PortalUrlService service;

    private PortalScope resolvedScope;

    @BeforeEach
    void setUp()
    {
        service = mock( PortalUrlService.class );
        final BeanContext context = mock( BeanContext.class );
        when( context.getService( PortalUrlService.class ) ).thenReturn( () -> service );
        resolvedScope = mock( PortalScope.class );
        when( service.portalScope( any() ) ).thenReturn( resolvedScope );
        when( service.pageUrlParts( any() ) ).thenReturn( new PageUrlParts( "https://example.test", "/nested/page", "" ) );
        bean = new ExplicitPageUrl();
        bean.initialize( context );
    }

    @Test
    void selectsBaseByPathIndependentlyOfTarget()
    {
        final PageUrlPartsParams params = invoke( Map.of(
            "id", "target-id", "project", "features", "branch", "master",
            "base", Map.of( "path", "/features" ) ) );

        assertEquals( "target-id", params.getId() );
        assertNull( params.getPath() );
        final PortalScopeParams scope = capturedScope();
        assertEquals( ProjectName.from( "features" ), scope.getProjectName() );
        assertEquals( Branch.from( "master" ), scope.getBranch() );
        assertEquals( ContentPath.from( "/features" ), scope.getContentPath() );
        assertNull( scope.getContentId() );
    }

    @Test
    void selectsBaseByIdAndPreservesQueryValues()
    {
        final PageUrlPartsParams params = invoke( Map.of(
            "path", "/features/nested/page", "project", "features", "branch", "draft", "base", Map.of( "id", "site-id" ),
            "params", Map.of( "q", "Tromsø + café & tea", "tag", List.of( "news", "events" ) ) ) );

        assertEquals( "/features/nested/page", params.getPath() );
        final PortalScopeParams scope = capturedScope();
        assertEquals( Branch.from( "draft" ), scope.getBranch() );
        assertEquals( ProjectName.from( "features" ), scope.getProjectName() );
        assertEquals( ContentId.from( "site-id" ), scope.getContentId() );
        assertNull( scope.getContentPath() );
        assertEquals( List.of( "Tromsø + café & tea" ), params.getQueryParams().get( "q" ) );
        assertEquals( List.of( "news", "events" ), params.getQueryParams().get( "tag" ) );
    }

    @Test
    void selectsProjectScopeAndLeavesBranchToTheExecutionContext()
    {
        final PageUrlPartsParams params = invoke( Map.of( "path", "/features/page", "project", "features" ) );

        assertEquals( "/features/page", params.getPath() );
        final PortalScopeParams scope = capturedScope();
        assertEquals( ProjectName.from( "features" ), scope.getProjectName() );
        assertNull( scope.getBranch() );
        assertNull( scope.getContentId() );
        assertNull( scope.getContentPath() );
    }

    @Test
    void joinsPartsWithoutABaseUrlAndPreservesEncodedQuery()
    {
        when( service.pageUrlParts( any() ) ).thenReturn( new PageUrlParts( null, "/features/page", "?q=a%20b%26c" ) );
        assertEquals( "/features/page?q=a%20b%26c", bean.pageUrl( options( Map.of( "path", "/features/page" ) ) ) );
    }

    @Test
    void joinsSiteRootWithoutAddingATrailingSlash()
    {
        when( service.pageUrlParts( any() ) ).thenReturn( new PageUrlParts( "https://example.test", "", "?q=test" ) );
        assertEquals( "https://example.test?q=test", bean.pageUrl( options( Map.of( "path", "/features" ) ) ) );
    }

    @Test
    void propagatesResolutionErrorsToTheSuite()
    {
        final IllegalArgumentException error = new IllegalArgumentException( "Content unavailable" );
        when( service.pageUrlParts( any() ) ).thenThrow( error );
        assertSame( error, assertThrows( IllegalArgumentException.class,
                                        () -> bean.pageUrl( options( Map.of( "path", "/missing" ) ) ) ) );
    }

    private PageUrlPartsParams invoke( final Map<String, Object> input )
    {
        assertEquals( "https://example.test/nested/page", bean.pageUrl( options( input ) ) );
        final ArgumentCaptor<PageUrlPartsParams> captured = ArgumentCaptor.forClass( PageUrlPartsParams.class );
        verify( service ).pageUrlParts( captured.capture() );
        assertSame( resolvedScope, captured.getValue().getScope() );
        return captured.getValue();
    }

    private PortalScopeParams capturedScope()
    {
        final ArgumentCaptor<PortalScopeParams> captured = ArgumentCaptor.forClass( PortalScopeParams.class );
        verify( service ).portalScope( captured.capture() );
        return captured.getValue();
    }

    private ScriptValue options( final Map<String, Object> input )
    {
        final ScriptValue value = mock( ScriptValue.class );
        when( value.getMap() ).thenReturn( input );
        return value;
    }
}
