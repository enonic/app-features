package com.enonic.xp.sample.features;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import com.enonic.xp.script.bean.ScriptBean;

public final class CronClientRegistry
    implements ScriptBean
{
    private static final Set<String> SSE_CLIENTS = ConcurrentHashMap.newKeySet();

    private static final Set<String> WS_SESSIONS = ConcurrentHashMap.newKeySet();

    private static final AtomicLong TICK_COUNTER = new AtomicLong();

    public void registerSse( final String clientId )
    {
        if ( clientId != null )
        {
            SSE_CLIENTS.add( clientId );
        }
    }

    public void unregisterSse( final String clientId )
    {
        if ( clientId != null )
        {
            SSE_CLIENTS.remove( clientId );
        }
    }

    public String[] listSse()
    {
        return SSE_CLIENTS.toArray( new String[0] );
    }

    public int countSse()
    {
        return SSE_CLIENTS.size();
    }

    public void registerWs( final String sessionId )
    {
        if ( sessionId != null )
        {
            WS_SESSIONS.add( sessionId );
        }
    }

    public void unregisterWs( final String sessionId )
    {
        if ( sessionId != null )
        {
            WS_SESSIONS.remove( sessionId );
        }
    }

    public String[] listWs()
    {
        return WS_SESSIONS.toArray( new String[0] );
    }

    public int countWs()
    {
        return WS_SESSIONS.size();
    }

    public long nextTick()
    {
        return TICK_COUNTER.incrementAndGet();
    }

    public long currentTick()
    {
        return TICK_COUNTER.get();
    }

    public void resetTick()
    {
        TICK_COUNTER.set( 0 );
    }

    @Override
    public void initialize( final com.enonic.xp.script.bean.BeanContext context )
    {
    }
}
