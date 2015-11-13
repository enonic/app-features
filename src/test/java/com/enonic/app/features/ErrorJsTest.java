package com.enonic.app.features;

import org.junit.Test;

import com.enonic.xp.testing.script.ScriptTestSupport;

public class ErrorJsTest
    extends ScriptTestSupport
{
    @Test
    public void test404()
    {
        runFunction( "/site/error/error-test.js", "test404" );
    }

    @Test
    public void testDefault()
    {
        runFunction( "/site/error/error-test.js", "testDefault" );
    }
}
