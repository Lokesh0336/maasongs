import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://msxszskyeqfaootgetlb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeHN6c2t5ZXFmYW9vdGdldGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjM5NTEsImV4cCI6MjA3OTIzOTk1MX0.Y2i9nCq1-D1GMZ4FtSNgy033gdX3AyOzmk9eUySBXwQ";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);