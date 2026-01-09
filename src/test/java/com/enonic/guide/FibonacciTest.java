package com.enonic.guide;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class FibonacciTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/lib/fibonacci-test.js";
    }
}
