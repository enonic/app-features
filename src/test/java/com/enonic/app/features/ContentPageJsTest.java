package com.enonic.app.features;

import org.junit.Test;

import com.enonic.xp.testing.script.ScriptTestSupport;

public class ContentPageJsTest
    extends ScriptTestSupport
{
    @Test
    public void testGet()
    {
        runFunction( "/site/pages/content/content-test.js", "testGet" );
    }
}
