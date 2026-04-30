// 1. Supabase setup (replace these with your real values)
const supabaseUrl = "https://xyzproject.supabase.co";     // from Settings → API
const supabaseAnonKey = "your_anon_key_here";            // public/anon key

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Connect to the form
const form = document.getElementById("requestForm");
const statusBox = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "Submitting...";

  // Read form fields (name matches your HTML names)
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const deadline = form.deadline.value; // ISO string, e.g. "2026-05-15"
  const project_type = form.project_type.value;
  const notes = form.notes.value.trim();
  const fileInput = form.querySelector("input[name='file']"); // if you add file upload

  let fileUrl = null;

  // 1. Upload file (only if you add a file field)
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const bucketName = "research_uploads";
    const path = `research/${Date.now()}_${file.name}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      statusBox.textContent = "Failed to upload file.";
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    fileUrl = publicUrlData.publicUrl;
  }

  // 2. Insert into `submissions` table
  const { data, error: insertError } = await supabase
    .from("submissions")
    .insert([
      {
        name,
        email,
        deadline,
        project_type,
        notes,
        file_url: fileUrl,
      },
    ]);

  if (insertError) {
    console.error("Insert error:", insertError);
    statusBox.textContent = "Your request is saved, but something went wrong.";
    return;
  }

  statusBox.textContent = "Request submitted successfully.";
  form.reset();
});
