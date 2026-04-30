// Initialize Supabase client (using a new variable name, not `supabase`)
const supabaseUrl = "https://ozhjabqkrnqxpphnyldz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aGphYnFrcm5xeHBwaG55bGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQ3ODksImV4cCI6MjA5MzE1MDc4OX0.Gq4Rb0778UsSAD_7DuyJacleBTJ_K1UMfPw2wtzpkLk";

// Use the existing `supabase` object from the CDN; create our client instance
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Connect to your form and status box
const form = document.getElementById("requestForm");
const statusBox = document.getElementById("status");

// Attach the form handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "Submitting...";

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const deadline = form.deadline.value;
  const project_type = form.project_type.value;
  const notes = form.notes.value.trim();

  // Optional: file upload (remove this block if you don’t want files yet)
  let fileUrl = null;
  const fileInput = form.querySelector("input[name='file']"); // only if you add <input name="file">
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const bucketName = "research_uploads";
    const path = `research/${Date.now()}_${file.name}`;

    const { data, error: uploadError } = await supabaseClient.storage
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

    const { data: publicUrlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(path);

    fileUrl = publicUrlData.publicUrl;
  }

  // Insert into Supabase
  const { data, error } = await supabaseClient
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

  // Always log this so we can see what’s happening
  console.log("insert data:", data);
  console.log("insert error:", error);

  if (error) {
    console.error("Insert error:", error);
    statusBox.textContent = "Failed to save your submission.";
    return;
  }

  statusBox.textContent = "Request submitted successfully.";
  form.reset();
});
