import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

export function ProfilePictureUploader() {
  const { user, profile, fetchProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refetch profile to update UI
      await fetchProfile(user);

      toast({
        title: "Sucesso!",
        description: "Sua foto de perfil foi atualizada.",
      });

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro no Upload",
        description: error.message || "Não foi possível enviar sua foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative group w-24 h-24 mx-auto">
      <Avatar className="w-24 h-24 border-4 border-primary/30 group-hover:border-primary transition-all duration-300">
        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || 'User'} className="object-cover" />
        <AvatarFallback className="text-3xl bg-primary/20 text-primary">
          {getInitials(profile?.name)}
        </AvatarFallback>
      </Avatar>
      <div 
        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={handleAvatarClick}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        ) : (
          <Upload className="h-8 w-8 text-white" />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        className="hidden"
        accept="image/png, image/jpeg"
        disabled={uploading}
      />
    </div>
  );
}
