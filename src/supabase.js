import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iktfoiyrzhsqzyjopdwr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdGZvaXlyemhzcXp5am9wZHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDk2OTEsImV4cCI6MjA3OTMyNTY5MX0.qn459ltShYE_rDiiS1fQELUh7_4WW7Bcv8fftrV9HRM";
export const supabase = createClient(supabaseUrl, supabaseKey);
