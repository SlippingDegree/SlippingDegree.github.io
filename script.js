// 1. Initialize Supabase client
const supabaseUrl = "https://ozhjabqkrnqxpphnyldz.supabase.co";  // <-- your project URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aGphYnFrcm5xeHBwaG55bGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQ3ODksImV4cCI6MjA5MzE1MDc4OX0.Gq4Rb0778UsSAD_7DuyJacleBTJ_K1UMfPw2wtzpkLk";        // <-- your anon/public key

const { createClient } = supabase;
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
