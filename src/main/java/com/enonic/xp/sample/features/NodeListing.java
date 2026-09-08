package com.enonic.xp.sample.features;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;

import com.enonic.xp.node.EnumerateNodesParams;
import com.enonic.xp.node.EnumerateNodesResult;
import com.enonic.xp.node.ListNodesParams;
import com.enonic.xp.node.NodeEnumerationEntry;
import com.enonic.xp.node.NodeListEntry;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodeService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

/**
 * Exposes the NodeService list and enumerate methods added in XP 8.1. Both read a subtree in path
 * order, filtered by what the caller may read: list streams every entry, enumerate returns the same
 * entries one bounded batch at a time with a cursor. Neither has an equivalent in lib-node, so a
 * bean is the only way to reach them from an application.
 * <p>
 * Results are returned as JSON strings rather than maps, so the shape does not depend on how a
 * particular script engine converts Java collections.
 */
public final class NodeListing
    implements ScriptBean
{
    private Supplier<NodeService> nodeService;

    @Override
    public void initialize( final BeanContext context )
    {
        this.nodeService = context.getService( NodeService.class );
    }

    /**
     * Streams every entry beneath a parent in path order. The limit only caps what is rendered;
     * the point of a stream is that the caller need not hold the whole subtree.
     */
    public String list( final String parentPath, final int limit )
    {
        try (Stream<NodeListEntry> entries = this.nodeService.get()
            .list( ListNodesParams.create().parentPath( new NodePath( parentPath ) ).build() ))
        {
            final StringBuilder json = new StringBuilder( "{\"entries\":[" );
            final long[] counted = {0};

            entries.forEach( entry -> {
                if ( counted[0] < limit )
                {
                    if ( counted[0] > 0 )
                    {
                        json.append( ',' );
                    }
                    appendEntry( json, entry.nodeId().toString(), entry.nodePath().toString(),
                                 entry.timestamp() == null ? null : entry.timestamp().toString(), null );
                }
                counted[0]++;
            } );

            return json.append( "],\"total\":" ).append( counted[0] ).append( '}' ).toString();
        }
    }

    /**
     * Returns one batch of the same entries, plus the cursor to continue from and how many remain.
     */
    public String enumerate( final String parentPath, final int batchSize, final String cursor )
    {
        final EnumerateNodesParams.Builder params = EnumerateNodesParams.create()
            .parentPath( new NodePath( parentPath ) )
            .batchSize( batchSize );

        if ( cursor != null && !cursor.isEmpty() )
        {
            params.cursor( cursor );
        }

        final EnumerateNodesResult result = this.nodeService.get().enumerate( params.build() );
        final List<NodeEnumerationEntry> entries = result.getEntries();

        final StringBuilder json = new StringBuilder( "{\"entries\":[" );

        for ( int i = 0; i < entries.size(); i++ )
        {
            final NodeEnumerationEntry entry = entries.get( i );
            if ( i > 0 )
            {
                json.append( ',' );
            }
            appendEntry( json, entry.nodeId().toString(), entry.nodePath().toString(),
                         entry.timestamp() == null ? null : entry.timestamp().toString(),
                         entry.versionId() == null ? null : entry.versionId().toString() );
        }

        json.append( "],\"remaining\":" ).append( result.getRemaining() ).append( ",\"cursor\":" );

        if ( result.getCursor() == null )
        {
            json.append( "null" );
        }
        else
        {
            json.append( '"' ).append( escape( result.getCursor() ) ).append( '"' );
        }

        return json.append( '}' ).toString();
    }

    private static void appendEntry( final StringBuilder json, final String id, final String path, final String timestamp,
                                     final String versionId )
    {
        json.append( "{\"id\":\"" ).append( escape( id ) ).append( "\",\"path\":\"" ).append( escape( path ) ).append( '"' );

        if ( timestamp != null )
        {
            json.append( ",\"timestamp\":\"" ).append( escape( timestamp ) ).append( '"' );
        }
        if ( versionId != null )
        {
            json.append( ",\"versionId\":\"" ).append( escape( versionId ) ).append( '"' );
        }

        json.append( '}' );
    }

    private static String escape( final String value )
    {
        return value.replace( "\\", "\\\\" ).replace( "\"", "\\\"" );
    }
}
