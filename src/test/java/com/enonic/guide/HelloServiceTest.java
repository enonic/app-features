package com.enonic.guide;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class HelloServiceTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/services/hello/hello-test.js";
    }
}
